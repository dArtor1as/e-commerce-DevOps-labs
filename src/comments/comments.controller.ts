import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  Req,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  create(
    @Req() req: { user: { sub: number } },
    @Body() createCommentDto: CreateCommentDto,
  ) {
    const { reviewId, content } = createCommentDto;
    const userId = req.user.sub;
    return this.commentsService.createComment(userId, reviewId, content);
  }

  @Get()
  findAll() {
    return this.commentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.commentsService.findOne(Number(id));
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateCommentDto: UpdateCommentDto) {
    const { content } = updateCommentDto;
    return this.commentsService.updateComment(Number(id), content);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: number,
    @Headers('authorization') authHeader: string,
  ) {
    if (!authHeader) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.split(' ')[1];
    try {
      this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      return await this.commentsService.deleteComment(Number(id));
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
