# frozen_string_literal: true

module Frontend
  module Dnd2024
    module Characters
      class SpellsController < Frontend::BaseController
        include Deps[
          to_bool: 'to_bool',
          add_spell: 'commands.characters_context.dnd2024.spells.add',
          change_spell: 'commands.characters_context.dnd2024.spells.change',
          feature_requirement: 'feature_requirement'
        ]
        include SerializeRelation
        include SerializeResource

        before_action :find_character
        before_action :find_spell, only: %i[create]
        before_action :find_character_spell, only: %i[update]

        def index
          serialize_relation_v2(spells, ::Dnd2024::Characters::SpellSerializer, :spells)
        end

        def create
          case add_spell.call(create_params.merge(character: @character, feat: @spell))
          in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
          in { result: result }
            serialize_resource(result, ::Dnd2024::Characters::SpellSerializer, :spell, {}, :created)
          end
        end

        def update
          case change_spell.call(update_params.merge(character_spell: @character_spell))
          in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
          else only_head_response
          end
        end

        def destroy
          character_spell = @character.feats.find_by!(feat_id: params[:id])
          character_spell.destroy
          only_head_response
        end

        private

        def find_character
          @character = authorized_scope(Character.all).dnd2024.find(params[:character_id])
        end

        def find_spell
          @spell = ::Dnd2024::Feat.where(origin: ::Dnd2024::Feat::SPELL_ORIGIN).find(params[:spell_id])
        end

        def find_character_spell
          @character_spell = @character.feats.find(params[:id])
        end

        def spells
          return [] unless feature_requirement.call(current: params[:version], initial: '0.4.5')

          @character.feats.includes(:feat).where(feats: { origin: 6 })
        end

        def create_params
          params.permit(:target_spell_class, :spell_ability).to_h
        end

        def update_params
          {
            ready_to_use: params[:ready_to_use].nil? ? nil : to_bool.call(params[:ready_to_use]),
            notes: params[:notes]
          }.compact
        end
      end
    end
  end
end
