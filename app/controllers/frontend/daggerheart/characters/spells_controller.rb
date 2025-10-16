# frozen_string_literal: true

module Frontend
  module Daggerheart
    module Characters
      class SpellsController < Frontend::BaseController
        include Deps[
          to_bool: 'to_bool',
          add_spell: 'commands.characters_context.daggerheart.add_spell',
          change_spell: 'commands.characters_context.daggerheart.change_spell'
        ]
        include SerializeRelation
        include SerializeResource

        before_action :find_character
        before_action :find_spell, only: %i[create]
        before_action :find_character_spell, only: %i[update destroy]

        def index
          serialize_relation(spells, ::Daggerheart::Characters::FeatSerializer, :spells)
        end

        def create
          case add_spell.call({ character: @character, spell: @spell })
          in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
          in { result: result }
            serialize_resource(result, ::Daggerheart::Characters::FeatSerializer, :spell, {}, :created)
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
          @character = authorized_scope(Character.all).daggerheart.find(params[:character_id])
        end

        def find_spell
          raise ActiveRecord::RecordNotFound if params[:version].blank?

          @spell = ::Daggerheart::Feat.where(origin: 7).find(params[:spell_id])
        end

        def find_character_spell
          raise ActiveRecord::RecordNotFound if params[:version].blank?

          @character_spell = @character.feats.find(params[:id])
        end

        def spells
          return [] if params[:version].blank?

          @character.feats.includes(:feat).where(feats: { origin: 7 })
        end

        def update_params
          result = params.require(:character_spell).permit!.to_h
          return result unless params.dig(:character_spell, :ready_to_use)

          result[:ready_to_use] = to_bool.call(params.dig(:character_spell, :ready_to_use))
          result
        end
      end
    end
  end
end
