import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ClientsService } from './clients.service';

@ApiTags('health')
@Controller()
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  @ApiOperation({ summary: 'Health check do serviço' })
  @ApiResponse({
    status: 200,
    description: 'Serviço está funcionando',
    schema: {
      type: 'string',
      example: 'Hello World!',
    },
  })
  getHello(): string {
    return this.clientsService.getHello();
  }
}
