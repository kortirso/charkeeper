# frozen_string_literal: true

module WebTelegram
  module Dnd5
    module Characters
      class ItemsController < WebTelegram::BaseController
        include Deps[
          character_item_add: 'commands.characters_context.dnd5.item_add',
          character_item_update: 'commands.characters_context.dnd5.item_update'
        ]
        include SerializeRelation

        INDEX_SERIALIZER_FIELDS = %i[id quantity ready_to_use name kind weight price].freeze

        before_action :find_character
        before_action :find_character_item, only: %i[update destroy]

        def index
          render json: serialize_relation(
            items,
            ::Dnd5::Characters::ItemSerializer,
            :items,
            only: INDEX_SERIALIZER_FIELDS
          ), status: :ok
        end

        def create
          case character_item_add.call(create_params)
          in { errors: errors } then render json: { errors: errors }, status: :unprocessable_entity
          else render json: { result: :ok }, status: :ok
          end
        end

        def update
          case character_item_update.call(update_params.merge({ character_item: @character_item }))
          in { errors: errors } then render json: { errors: errors }, status: :unprocessable_entity
          else render json: { result: :ok }, status: :ok
          end
        end

        def destroy
          @character_item.destroy
          render json: { result: :ok }, status: :ok
        end

        private

        def find_character
          @character =
            current_user
              .user_characters
              .where(provider: User::Character::DND5)
              .find(params[:character_id])
              .characterable
        end

        def find_character_item
          @character_item = @character.items.find(params[:id])
        end

        def items
          @character
            .items
            .includes(:item)
            .order('dnd5_character_items.ready_to_use DESC')
        end

        def create_params
          {
            character: @character,
            item: ::Dnd5::Item.find(params[:item_id])
          }
        end

        def update_params
          params.require(:character_item).permit!.to_h
        end
      end
    end
  end
end
