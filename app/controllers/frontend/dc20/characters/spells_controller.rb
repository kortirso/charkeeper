# frozen_string_literal: true

module Frontend
  module Dc20
    module Characters
      class SpellsController < Frontend::BaseController
        include Deps[
          add_spell: 'commands.characters_context.dc20.spells.add',
          change_spell: 'commands.characters_context.dc20.spells.change'
        ]
        include SerializeRelation
        include SerializeResource

        before_action :find_character
        before_action :find_spell, only: %i[create]
        before_action :find_character_spell, only: %i[update destroy]

        def index
          serialize_relation(spells, ::Dc20::Characters::SpellSerializer, :spells)
        end

        def create
          case add_spell.call({ character: @character, spell: @spell })
          in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
          in { result: result }
            serialize_resource(result, ::Dc20::Characters::SpellSerializer, :spell, {}, :created)
          end
        end

        def update
          case change_spell.call(update_params.merge({ character: @character, character_spell: @character_spell }))
          in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
          else only_head_response
          end
        end

        def destroy
          @character_spell.destroy
          only_head_response
        end

        private

        def find_character
          @character = authorized_scope(Character.all).dc20.find(params[:character_id])
        end

        def find_spell
          @spell = ::Dc20::Feat.where(origin: 7).find(params[:spell_id])
        end

        def find_character_spell
          @character_spell = @character.feats.find_by(feat_id: params[:id])
        end

        def spells
          @character.feats.includes(:feat).where(feats: { origin: 7 })
        end

        def update_params
          params.require(:character_spell).permit!.to_h
        end
      end
    end
  end
end
