import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EventMeta } from '@rumsan/sdk/types/event.types';

import { PrismaService } from '@rumsan/prisma';
import { EVENTS } from '@rumsan/raman/constants';
import { FileAttachment } from '@rumsan/raman/types';
import { Expense } from '@rumsan/raman/types/expense.type';
import { WebSocketService } from '../app/websocket.service';
import { mergeArraysByUniqueKey } from '../utils/array.utils';
import { UploadFileToGdrive } from '../utils/file-attachment.utils';
import { GDriveService } from '../utils/gdrive.utils';
import { FileAttachmentWithBuffer } from '../utils/types';

@Injectable()
export class ExpenseListener {
  private otp: string;
  private readonly logger = new Logger(ExpenseListener.name);
  constructor(
    private prisma: PrismaService,
    private gdrive: GDriveService,
    private ws: WebSocketService,
  ) {}

  @OnEvent(EVENTS.EXPENSE.UPLOAD)
  async OnExpenseUpload(
    expense: Expense,
    attachments: FileAttachmentWithBuffer[],
    meta: EventMeta,
  ) {
    if (!expense) return;

    const existingAttachments: FileAttachment[] =
      (expense.attachments as FileAttachment[]) || [];

    const newAttachments: FileAttachment[] = [];
    for (const attachment of attachments) {
      const { file } = await UploadFileToGdrive(attachment, this.gdrive);
      newAttachments.push(file);
    }

    const updatedRec = await this.prisma.expense.update({
      where: { cuid: expense.cuid },
      data: {
        attachments: mergeArraysByUniqueKey(
          existingAttachments,
          newAttachments,
          'hash',
        ),
      },
    });

    if (meta?.clientId) {
      this.ws.sendToClient(meta?.clientId, EVENTS.EXPENSE.UPLOAD, {
        cuid: updatedRec.cuid,
      });
    }
  }
}
