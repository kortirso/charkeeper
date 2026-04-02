# frozen_string_literal: true

module Frontend
  module Pathfinder2
    module Characters
      class SpellsController < Frontend::BaseController
        include Deps[
          add_spell: 'commands.characters_context.pathfinder2.spells.add',
          change_spell: 'commands.characters_context.pathfinder2.spells.change'
        ]
        include SerializeRelation
        include SerializeResource

        before_action :find_character
        before_action :find_spell, only: %i[create]
        before_action :find_character_spell, only: %i[update]

        def index
          serialize_relation_v2(
            spells, ::Pathfinder2::Characters::SpellSerializer, :spells, order_options: { key: %w[spell title] }
          )
        end

        def create
          case add_spell.call(spell_params.merge(character: @character, feat: @spell))
          in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
          in { result: result }
            serialize_resource(result, ::Pathfinder2::Characters::SpellSerializer, :spell, {}, :created)
          end
        end

        def update
          case change_spell.call(spell_params.merge(character_spell: @character_spell))
          in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
          in { result: result }
            serialize_resource(result, ::Pathfinder2::Characters::SpellSerializer, :spell, {}, :ok)
          end
        end

        def destroy
          character_spell = @character.feats.find_by!(feat_id: params[:id])
          character_spell.destroy
          only_head_response
        end

        private

        def find_character
          @character = authorized_scope(Character.all).pathfinder2.find(params[:character_id])
        end

        def find_spell
          @spell = ::Pathfinder2::Feat.where(origin: ::Pathfinder2::Feat::SPELL_ORIGIN).find(params[:spell_id])
        end

        def find_character_spell
          @character_spell = @character.feats.find(params[:id])
        end

        def spells
          @character.feats.includes(:feat).where(feats: { origin: 4 })
        end

        def spell_params
          params.require(:spell).permit!.to_h
        end
      end
    end
  end
end
