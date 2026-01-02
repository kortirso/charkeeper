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

        before_action :find_character
        before_action :find_spell, only: %i[create]

        def index
          serialize_relation_v2(spells, ::Dnd5::Characters::SpellSerializer, :spells)
        end

        def create
          case character_spell_add.call(create_params.merge(character: @character, spell: @spell))
          in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
          in { result: result }
            serialize_resource(result, ::Dnd5::Characters::SpellSerializer, :spell, {}, :created)
          end
        end

        def update
          case character_spell_update.call(update_params)
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
          @character = authorized_scope(Character.all).dnd5.find(params[:character_id])
        end

        def find_spell
          @spell = ::Spell.dnd5.find(params[:spell_id])
        end

        def spells
          @character.spells.includes(:spell)
        end

        def create_params
          params.permit(:target_spell_class, :spell_ability).to_h
        end

        def update_params
          result =
            params
              .permit(:notes).to_h
              .merge({ character: @character, character_spell: @character.spells.find(params[:id]) })
          result[:ready_to_use] = to_bool.call(params[:ready_to_use]) if params.key?(:ready_to_use)
          result
        end
      end
    end
  end
end
