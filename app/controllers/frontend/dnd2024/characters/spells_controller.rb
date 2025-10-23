# frozen_string_literal: true

module Frontend
  module Dnd2024
    module Characters
      class SpellsController < Frontend::BaseController
        include Deps[
          to_bool: 'to_bool',
          character_spell_add: 'commands.characters_context.dnd2024.spell_add',
          character_spell_update: 'commands.characters_context.dnd2024.spell_update'
        ]
        include SerializeRelation
        include SerializeResource

        INDEX_SERIALIZER_FIELDS = %i[id ready_to_use prepared_by spell_ability notes slug name level spell_id].freeze

        before_action :find_character
        before_action :find_spell, only: %i[create]

        def index
          serialize_relation(spells, ::Dnd2024::Characters::SpellSerializer, :spells, only: INDEX_SERIALIZER_FIELDS)
        end

        def create
          case character_spell_add.call(create_params.merge(character: @character, spell: @spell))
          in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
          in { result: result }
            serialize_resource(result, ::Dnd2024::Characters::SpellSerializer, :spell, {}, :created)
          end
        end

        def update
          case character_spell_update.call(update_params.merge(character: @character))
          in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
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
          @character = authorized_scope(Character.all).dnd2024.find(params[:character_id])
        end

        def find_spell
          @spell = ::Spell.dnd2024.find(params[:spell_id])
        end

        def spells
          @character.spells.includes(:spell)
        end

        def create_params
          params.permit(:target_spell_class, :spell_ability).to_h
        end

        def update_params
          {
            character_spell: @character.spells.find(params[:id]),
            ready_to_use: params[:ready_to_use] ? to_bool.call(params[:ready_to_use]) : nil,
            notes: params[:notes]
          }.compact
        end
      end
    end
  end
end
