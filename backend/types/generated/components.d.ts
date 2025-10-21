import type { Schema, Struct } from '@strapi/strapi';

export interface BlocosCartao extends Struct.ComponentSchema {
  collectionName: 'components_blocos_cartaos';
  info: {
    displayName: 'Cart\u00E3o';
  };
  attributes: {
    icone: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    imagem: Schema.Attribute.Media<'images'>;
    subtitulo: Schema.Attribute.String;
    titulo: Schema.Attribute.String & Schema.Attribute.Required;
    url: Schema.Attribute.String;
  };
}

export interface NavMenu extends Struct.ComponentSchema {
  collectionName: 'components_nav_menus';
  info: {
    displayName: 'Menu';
  };
  attributes: {
    categorias: Schema.Attribute.Relation<
      'manyToMany',
      'api::categoria.categoria'
    >;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    marcas: Schema.Attribute.Relation<'manyToMany', 'api::marca.marca'>;
    url: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'blocos.cartao': BlocosCartao;
      'nav.menu': NavMenu;
    }
  }
}
