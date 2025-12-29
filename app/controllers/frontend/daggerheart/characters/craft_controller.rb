# frozen_string_literal: true

module Frontend
  module Daggerheart
    module Characters
      class CraftController < Frontend::BaseController
        include Deps[
          craft: 'commands.characters_context.daggerheart.craft.perform'
        ]
        include SerializeRelation

        before_action :find_character
        before_action :find_item, only: %i[create]

        def index
          serialize_relation(tools, ::Daggerheart::Item::ToolSerializer, :tools)
        end

        def create
          case craft.call({ character: @character, item: @item, amount: params[:amount] })
          in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
          else only_head_response
          end
        end

        private

        def find_character
          @character = authorized_scope(Character.all).daggerheart.find(params[:character_id])
        end

        def find_item
          @item = ::Daggerheart::Item.find(params[:item_id])
        end

        def tools
          ::Daggerheart::Item
            .where(kind: 'recipe', id: @character.items.select(:item_id))
            .includes(recipes: :item)
        end
      end
    end
  end
end
