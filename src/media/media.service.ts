import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Media } from 'src/entity';
import { CreateMediaDTO } from './dtos';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
  ) {}

  async create(createMediaDTO: CreateMediaDTO): Promise<Media> {
    const media = this.mediaRepository.create(createMediaDTO);

    return this.mediaRepository.save(media);
  }
}
