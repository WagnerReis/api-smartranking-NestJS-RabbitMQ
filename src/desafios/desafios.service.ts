import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CategoriasService } from 'src/categorias/categorias.service';
import { JogadoresService } from 'src/jogadores/jogadores.service';
import { AtribuirDesafioPartidaDto } from 'src/desafios/dtos/atribuir-desafio-partida.dto';
import { DesafioStatus } from './interfaces/desafio-status.enum';
import { AtualizarDesafioDto } from './dtos/atualizar-desafio.dto';
import { CriarDesafioDto } from './dtos/criar-desafio.dto';
import { Desafio, Partida } from './interfaces/desafio.interface';

@Injectable()
export class DesafiosService {
  constructor(
    @InjectModel('Desafio') private readonly desafioModel: Model<Desafio>,
    @InjectModel('Partida') private readonly partidaModel: Model<Partida>,
    private readonly jogadoresService: JogadoresService,
    private readonly categoriasService: CategoriasService,
  ) {}

  async criarDesafio(criarDesafioDto: CriarDesafioDto): Promise<Desafio> {
    const { jogadores, solicitante } = criarDesafioDto;

    const idJogadores = [];

    for (const jogador of jogadores) {
      const jogadorEncontradoNaBase =
        await this.jogadoresService.consultarJogadorPeloId(jogador._id);

      if (!jogadorEncontradoNaBase) {
        throw new NotFoundException(`Jogador ${jogador._id} não cadastrado!`);
      }

      idJogadores.push(jogador._id);
    }

    if (!idJogadores.includes(solicitante)) {
      throw new BadRequestException(`O solicitante não faz parte do desafio`);
    }

    const solicitanteRegistrado =
      await this.categoriasService.verificarJogadorCadastradoEmCategoria(
        solicitante,
      );

    if (!solicitanteRegistrado) {
      throw new BadRequestException(
        `O solicitante ${solicitante._id} não está cadastrado em nenhuma categoria!`,
      );
    }
    const newDesafio = {
      ...criarDesafioDto,
      categoria: solicitanteRegistrado.categoria,
      dataHoraSolicitado: new Date(),
      status: DesafioStatus.PENDENTE,
    };

    const desafioCriado = new this.desafioModel(newDesafio);
    return await desafioCriado.save();
  }

  async consultarTodosDesafios(): Promise<Desafio[]> {
    const desafios = await this.desafioModel
      .find()
      .populate('solicitante')
      .populate('jogadores')
      .populate('partida');
    return desafios;
  }

  async consultarDesafiosDeUmJogador(params: string[]): Promise<Desafio[]> {
    const idJogador = params['idJogador'];

    const desafioEncontrado = await this.desafioModel
      .find()
      .where('jogadores')
      .in(idJogador)
      .populate('solicitante')
      .populate('jogadores')
      .populate('partida');

    if (!desafioEncontrado.length) {
      throw new NotFoundException(`Desafio não encontrado!`);
    }

    return desafioEncontrado;
  }

  async atualizarDesafio(
    _id: string,
    atualizarDesafioDto: AtualizarDesafioDto,
  ): Promise<void> {
    await this.encontrarDesafio(_id);

    await this.desafioModel.updateOne({ _id }, { $set: atualizarDesafioDto });
  }

  async deletarDesafio(_id: string): Promise<void> {
    await this.encontrarDesafio(_id);

    await this.desafioModel.updateOne(
      { _id },
      { $set: { status: 'CANCELADO' } },
    );
  }

  async encontrarDesafio(_id: string): Promise<Desafio> {
    const desafioEncontrado = await this.desafioModel.findOne({ _id });

    if (!desafioEncontrado) {
      throw new NotFoundException('Desafio não encontrado!');
    }

    return desafioEncontrado;
  }

  async atribuirDesafioPartida(
    _id: string,
    atribuirDesafioPartidaDto: AtribuirDesafioPartidaDto,
  ): Promise<void> {
    const desafioEncontrado = await this.encontrarDesafio(_id);

    const { def } = atribuirDesafioPartidaDto;

    const vencedorValido = desafioEncontrado.jogadores.some((jogador) =>
      jogador._id.equals(def),
    );

    if (!vencedorValido) {
      throw new BadRequestException(`Vencedor nao participou do desafio`);
    }

    const partidaCriada = new this.partidaModel(atribuirDesafioPartidaDto);
    partidaCriada.categoria = desafioEncontrado.categoria;
    partidaCriada.jogadores = desafioEncontrado.jogadores;

    const resultado = await partidaCriada.save();

    desafioEncontrado.status = DesafioStatus.REALIZADO;

    desafioEncontrado.partida = resultado._id;

    await this.desafioModel.findOneAndUpdate(
      { _id },
      { $set: desafioEncontrado },
    );
  }
}
