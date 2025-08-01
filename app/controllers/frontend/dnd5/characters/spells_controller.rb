# frozen_string_literal: true

module Frontend
  module Dnd5
    module Characters
      class SpellsController < Frontend::BaseController
        include Deps[
          to_bool: 'to_bool',
          character_spell_add: 'commands.characters_context.dnd5.spell_add',
          character_spell_update: 'commands.characters_context.dnd5.spell_update'
        ]
        include SerializeRelation
        include SerializeResource

        INDEX_SERIALIZER_FIELDS = %i[id ready_to_use prepared_by notes slug name level spell_id].freeze

        before_action :find_character

        def index
          serialize_relation(spells, ::Dnd5::Characters::SpellSerializer, :spells, only: INDEX_SERIALIZER_FIELDS)
        end

        def create
          case character_spell_add.call(create_params)
          in { errors: errors } then unprocessable_response(errors)
          in { result: result }
            serialize_resource(result, ::Dnd5::Characters::SpellSerializer, :spell, {}, :created)
          end
        end

        def update
          case character_spell_update.call(update_params)
          in { errors: errors } then unprocessable_response(errors)
          else only_head_response
          end
        end

        def destroy
          character_spell = @character.spells.find_by!(spell_id: params[:id])
          character_spell.destroy
          only_head_response
        end

        private

        def find_character
          @character = authorized_scope(Character.all).dnd5.find(params[:character_id])
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
