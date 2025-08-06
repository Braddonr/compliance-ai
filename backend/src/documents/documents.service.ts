import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Document, DocumentStatus } from "./entities/document.entity";
import { DocumentVersion } from "./entities/document-version.entity";
import { CreateDocumentDto } from "./dto/create-document.dto";
import { UpdateDocumentDto } from "./dto/update-document.dto";

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private documentsRepository: Repository<Document>,
    @InjectRepository(DocumentVersion)
    private versionsRepository: Repository<DocumentVersion>
  ) {}

  async findAll(organizationId?: string): Promise<Document[]> {
    const queryBuilder = this.documentsRepository
      .createQueryBuilder("document")
      .leftJoinAndSelect("document.framework", "framework")
      .leftJoinAndSelect("document.createdBy", "createdBy")
      .leftJoinAndSelect("document.collaborators", "collaborators")
      .leftJoinAndSelect("document.organization", "organization");

    if (organizationId) {
      queryBuilder.where("organization.id = :organizationId", {
        organizationId,
      });
    }

    return queryBuilder.orderBy("document.updatedAt", "DESC").getMany();
  }

  async findOne(id: string): Promise<Document> {
    const document = await this.documentsRepository.findOne({
      where: { id },
      relations: [
        "framework",
        "createdBy",
        "collaborators",
        "organization",
        "versions",
      ],
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    return document;
  }

  async create(
    createDocumentDto: CreateDocumentDto,
    userId: string
  ): Promise<Document> {
    const document = this.documentsRepository.create({
      ...createDocumentDto,
      createdBy: { id: userId },
      organization: { id: createDocumentDto.organizationId },
      framework: { id: createDocumentDto.frameworkId },
    });

    const savedDocument = await this.documentsRepository.save(document);

    // Create initial version
    await this.createVersion(savedDocument.id, {
      version: "1.0.0",
      content: createDocumentDto.content,
      changeLog: "Initial version",
      createdBy: { id: userId },
    });

    return this.findOne(savedDocument.id);
  }

  async update(
    id: string,
    updateDocumentDto: UpdateDocumentDto,
    userId: string
  ): Promise<Document> {
    const document = await this.findOne(id);
    const oldContent = document.content;

    Object.assign(document, updateDocumentDto);
    const updatedDocument = await this.documentsRepository.save(document);

    // Create new version if content changed
    if (updateDocumentDto.content && updateDocumentDto.content !== oldContent) {
      const versions = await this.versionsRepository.find({
        where: { document: { id } },
        order: { createdAt: "DESC" },
      });

      const lastVersion = versions[0];
      const newVersionNumber = this.incrementVersion(
        lastVersion?.version || "1.0.0"
      );

      await this.createVersion(id, {
        version: newVersionNumber,
        content: updateDocumentDto.content,
        changeLog: updateDocumentDto.changeLog || "Document updated",
        createdBy: { id: userId },
      });
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const document = await this.findOne(id);
    await this.documentsRepository.remove(document);
  }

  async addCollaborator(documentId: string, userId: string): Promise<Document> {
    const document = await this.findOne(documentId);

    // Check if user is already a collaborator
    const isCollaborator = document.collaborators.some((c) => c.id === userId);
    if (!isCollaborator) {
      document.collaborators.push({ id: userId } as any);
      await this.documentsRepository.save(document);
    }

    return this.findOne(documentId);
  }

  async removeCollaborator(
    documentId: string,
    userId: string
  ): Promise<Document> {
    const document = await this.findOne(documentId);
    document.collaborators = document.collaborators.filter(
      (c) => c.id !== userId
    );
    await this.documentsRepository.save(document);
    return this.findOne(documentId);
  }

  async getVersions(documentId: string): Promise<DocumentVersion[]> {
    return this.versionsRepository.find({
      where: { document: { id: documentId } },
      relations: ["createdBy"],
      order: { createdAt: "DESC" },
    });
  }

  async getByFramework(
    frameworkId: string,
    organizationId?: string
  ): Promise<Document[]> {
    const queryBuilder = this.documentsRepository
      .createQueryBuilder("document")
      .leftJoinAndSelect("document.framework", "framework")
      .leftJoinAndSelect("document.createdBy", "createdBy")
      .leftJoinAndSelect("document.collaborators", "collaborators")
      .leftJoinAndSelect("document.organization", "organization")
      .where("framework.id = :frameworkId", { frameworkId });

    if (organizationId) {
      queryBuilder.andWhere("organization.id = :organizationId", {
        organizationId,
      });
    }

    return queryBuilder.orderBy("document.updatedAt", "DESC").getMany();
  }

  private async createVersion(
    documentId: string,
    versionData: any
  ): Promise<DocumentVersion> {
    const version = this.versionsRepository.create({
      ...versionData,
      document: { id: documentId } as any,
    });
    const savedVersion = await this.versionsRepository.save(version);
    return Array.isArray(savedVersion) ? savedVersion[0] : savedVersion;
  }

  private incrementVersion(currentVersion: string): string {
    const parts = currentVersion.split(".").map(Number);
    parts[2] = (parts[2] || 0) + 1; // Increment patch version
    return parts.join(".");
  }
}
