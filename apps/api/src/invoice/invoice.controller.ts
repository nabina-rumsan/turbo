import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { xRC } from '@rumsan/extensions/decorators';
import { ACTIONS, APP, SUBJECTS } from '@rumsan/raman/constants';
import { tRC } from '@rumsan/sdk/types';
import { AbilitiesGuard, CheckAbilities, JwtGuard } from '@rumsan/user';

import { InvoiceFile } from '../decorator/invoiceBody';
import { ReceiptReimbursementDto } from './dto/invoice-misc.dto';
import { CreateInvoiceDto } from './dto/invoice.dto';
import {
  // ReimburseInvoiceDto,
  InvoiceFilterDto,
  ListInvoiceDto,
  UpdateInvoiceDto,
} from './dto/update-invoice.dto';
import { InvoiceService } from './invoice.service';
@Controller('invoices')
@ApiTags('invoice')
@ApiBearerAuth(APP.JWT_BEARER)
@UseGuards(JwtGuard, AbilitiesGuard)
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  @CheckAbilities({ actions: ACTIONS.CREATE, subject: SUBJECTS.INVOICE })
  @ApiConsumes('multipart/form-data')
  @InvoiceFile()
  @UseInterceptors(FilesInterceptor('receipts'))
  async createInvoice(
    @UploadedFiles() files: Array<Express.Multer.File>, // Accept an array of files
    @Body() dto: CreateInvoiceDto,
    @xRC() rc: tRC,
  ) {
    const res = await this.invoiceService.createInvoice(dto, files, rc);
    return res;
  }

  @CheckAbilities({ actions: ACTIONS.UPDATE, subject: SUBJECTS.INVOICE })
  @Patch(':invoiceId')
  updateInvoice(
    @Param('invoiceId') invoiceId: string,
    @Body() dto: UpdateInvoiceDto,
    @xRC() rc: tRC,
  ) {
    return this.invoiceService.updateInvoice(invoiceId, dto, rc);
  }

  @Patch(':invoiceId/reimburse')
  @CheckAbilities({ actions: ACTIONS.UPDATE, subject: SUBJECTS.INVOICE })
  @ApiConsumes('multipart/form-data')
  @InvoiceFile()
  @UseInterceptors(FilesInterceptor('attachments'))
  reimburseInvoice(
    @Param('invoiceId') invoiceId: string,
    @UploadedFiles() files: Array<Express.Multer.File>, // Accept an array of files
    @Body() dto: ReceiptReimbursementDto,
    @xRC() rc: tRC,
  ) {
    return this.invoiceService.reimburseInvoice(invoiceId, dto, files, rc);
  }

  @Get()
  @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.INVOICE })
  //TODO:fix any
  getInvoice(@Query() query: ListInvoiceDto): any {
    return this.invoiceService.findAll(query);
  }

  @Post('search')
  @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.INVOICE })
  //TODO:fix any
  listExpensesWithFilter(
    @Query() query: ListInvoiceDto,
    @Body() filters: InvoiceFilterDto,
  ): any {
    return this.invoiceService.findAll(query, filters);
  }

  @Get(':invoiceId')
  @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.INVOICE })
  getOneInvoice(@Param('invoiceId') invoiceId: string) {
    return this.invoiceService.findOne(invoiceId);
  }

  @Delete(':id')
  @CheckAbilities({ actions: ACTIONS.DELETE, subject: SUBJECTS.INVOICE })
  deleteInvoice(@Param('id') id: string, @xRC() rc: tRC) {
    return this.invoiceService.deleteInvoice(id, rc);
  }
}
