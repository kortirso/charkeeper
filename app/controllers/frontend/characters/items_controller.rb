# frozen_string_literal: true

module Frontend
  module Characters
    class ItemsController < Frontend::BaseController
      include Deps[
        character_item_add: 'commands.characters_context.item_add',
        character_item_update: 'commands.characters_context.item_update'
      ]
      include SerializeRelation

      before_action :find_character
      before_action :find_character_item, only: %i[update destroy]

      def index
        serialize_relation(items, ::Characters::ItemSerializer, :items)
      end

      def create
        case character_item_add.call(create_params)
        in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
        else only_head_response
        end
      end

      def update
        case character_item_update.call(update_params.merge({ character_item: @character_item }))
        in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
        else only_head_response
        end
      end

      def destroy
        @character_item.destroy
        only_head_response
      end

      private

      def find_character
        @character = characters_relation.find(params[:character_id])
      end

      def find_character_item
        @character_item = @character.items.find(params[:id])
      end

      def items
        @character.items.includes(:item)
      end

      def create_params
        {
          character: @character,
          item: items_relation.find(params[:item_id])
        }
      end

      def update_params
        params.expect(character_item: %i[quantity ready_to_use notes state]).to_h
      end

      def characters_relation
        case params[:provider]
        when 'dnd5', 'dnd2024' then authorized_scope(Character.all).dnd
        when 'pathfinder2' then authorized_scope(Character.all).pathfinder2
        when 'daggerheart' then authorized_scope(Character.all).daggerheart
        else Character.none
        end
      end

      def items_relation
        case params[:provider]
        when 'dnd5', 'dnd2024' then ::Item.dnd
        when 'pathfinder2' then ::Item.pathfinder2
        when 'daggerheart' then ::Item.daggerheart
        else []
        end
      end
    end
  end
end
