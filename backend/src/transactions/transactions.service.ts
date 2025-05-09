import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction, TransactionStatus } from './entities/transactions.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { QueryTransactionDto } from './dto/query-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
  ) {}

async create(createTransactionDto: CreateTransactionDto): Promise<Transaction> {
  // Convert DTO to entity format
  const transaction = new Transaction();
  Object.assign(transaction, createTransactionDto);
  
  // Save and return
  return await this.transactionsRepository.save(transaction);
}

  async findAll(query: QueryTransactionDto = {}): Promise<Transaction[]> {
    const queryBuilder =
      this.transactionsRepository.createQueryBuilder('transaction');

    if (query.type) {
      queryBuilder.andWhere('transaction.type = :type', { type: query.type });
    }

    if (query.status) {
      queryBuilder.andWhere('transaction.status = :status', {
        status: query.status,
      });
    }

    if (query.userId) {
      queryBuilder.andWhere('transaction.userId = :userId', {
        userId: query.userId,
      });
    }

    if (query.txHash) {
      queryBuilder.andWhere('transaction.txHash = :txHash', {
        txHash: query.txHash,
      });
    }

    if (query.contractAddress) {
      queryBuilder.andWhere('transaction.contractAddress = :contractAddress', {
        contractAddress: query.contractAddress,
      });
    }

    return queryBuilder.getMany();
  }

async findOne(id: string | number): Promise<Transaction> {
  // If id is a string but needs to be a number for the database
  const idValue = typeof id === 'string' ? parseInt(id, 10) : id;
  
  const transaction = await this.transactionsRepository.findOne({
    where: { id: idValue },
  });
  
  if (!transaction) {
    throw new NotFoundException(`Transaction with ID ${id} not found`);
  }
  
  return transaction;
}

  async findByTxHash(txHash: string): Promise<Transaction> {
    const transaction = await this.transactionsRepository.findOne({
      where: { txHash },
    });
    if (!transaction) {
      throw new NotFoundException(`Transaction with hash ${txHash} not found`);
    }
    return transaction;
  }

  async update(
    id: string,
    updateTransactionDto: UpdateTransactionDto,
  ): Promise<Transaction> {
    const transaction = await this.findOne(id);
    Object.assign(transaction, updateTransactionDto);
    return this.transactionsRepository.save(transaction);
  }

  async updateByTxHash(
    txHash: string,
    updateTransactionDto: UpdateTransactionDto,
  ): Promise<Transaction> {
    const transaction = await this.findByTxHash(txHash);
    Object.assign(transaction, updateTransactionDto);
    return this.transactionsRepository.save(transaction);
  }

  async updateTransactionStatus(
    id: string,
    status: TransactionStatus,
  ): Promise<Transaction> {
    const transaction = await this.findOne(id);
    transaction.status = status;
    return this.transactionsRepository.save(transaction);
  }

  async remove(id: string): Promise<void> {
    const transaction = await this.findOne(id);
    await this.transactionsRepository.remove(transaction);
  }
}
