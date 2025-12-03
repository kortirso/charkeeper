# frozen_string_literal: true

module Frontend
  module Dnd2024
    module Characters
      class CraftController < Frontend::BaseController
        include Deps[
          craft: 'commands.characters_context.dnd2024.craft'
        ]
        include SerializeRelation

        before_action :find_character
        before_action :find_item, only: %i[create]

        def index
          serialize_relation(tools, ::Dnd2024::Item::ToolSerializer, :tools)
        end

        def create
          case craft.call({ character: @character, item: @item, amount: params[:amount], price: params[:price] })
          in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
          else only_head_response
          end
        end

        private

        def find_character
          @character = authorized_scope(Character.all).dnd2024.find(params[:character_id])
        end

        def find_item
          @item = ::Dnd5::Item.find(params[:item_id])
        end

        def tools
          ::Dnd5::Item
            .where(slug: @character.data.tools, kind: 'tools', id: @character.items.select(:item_id))
            .includes(recipes: :item)
        end
      end
    end
  end
end
