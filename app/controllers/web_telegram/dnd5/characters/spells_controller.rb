# frozen_string_literal: true

module WebTelegram
  module Dnd5
    module Characters
      class SpellsController < WebTelegram::BaseController
        include Deps[
          to_bool: 'to_bool',
          character_spell_add: 'commands.characters_context.dnd5.spell_add',
          character_spell_update: 'commands.characters_context.dnd5.spell_update'
        ]
        include SerializeRelation

        INDEX_SERIALIZER_FIELDS = %i[id ready_to_use prepared_by notes slug name level spell_id].freeze

        before_action :find_character

        def index
          render json: serialize_relation(
            spells,
            ::Dnd5::Characters::SpellSerializer,
            :spells,
            only: INDEX_SERIALIZER_FIELDS
          ), status: :ok
        end

        def create
          case character_spell_add.call(create_params)
          in { errors: errors } then render json: { errors: errors }, status: :unprocessable_entity
          else render json: { result: :ok }, status: :ok
          end
        end

        def update
          case character_spell_update.call(update_params)
          in { errors: errors } then render json: { errors: errors }, status: :unprocessable_entity
          else render json: { result: :ok }, status: :ok
          end
        end

        def destroy
          character_spell = @character.spells.find_by!(spell_id: params[:id])
          character_spell.destroy
          render json: { result: :ok }, status: :ok
        end

        private

        def find_character
          @character = current_user.characters.dnd5.find(params[:character_id])
        end

        def spells
          @character.spells.includes(:spell)
        end

        def create_params
          {
            character: @character,
            spell: ::Spell.dnd5.find(params[:spell_id]),
            target_spell_class: params[:target_spell_class]
          }
        end

        def update_params
          result =
            params
              .permit(:notes).to_h
              .merge({ character: @character, character_spell: @character.spells.find(params[:id]) })
          result[:ready_to_use] = to_bool.call(params[:ready_to_use]) if params[:ready_to_use]
          result
        end
      end
    end
  end
end
