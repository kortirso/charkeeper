# frozen_string_literal: true

module Frontend
  module Dc20
    module Characters
      class TalentsController < Frontend::BaseController
        include Deps[
          add_talent: 'commands.characters_context.dc20.talents.add'
        ]
        include SerializeRelation
        include SerializeResource

        before_action :find_character
        before_action :find_talent, only: %i[create]
        before_action :find_feat, only: %i[create]

        def index
          serialize_relation(
            available_talents, ::Dc20::Characters::TalentSerializer, :talents, {}, { selected_talents: @selected_talents }
          )
        end

        def create
          case add_talent.call({ character: @character, talent: @talent, feat: @feat })
          in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
          else only_head_response
          end
        end

        private

        def find_character
          @character = authorized_scope(Character.all).dc20.find(params[:character_id])
        end

        def find_talent
          @talent = ::Dc20::Feat.where(origin: 4).find(params[:talent_id])
        end

        def find_feat
          @feat = ::Dc20::Feat.where(origin: 1).find_by(id: params[:talent_feature_id])
        end

        def available_talents
          @selected_talents = @character.data.selected_talents.keys
          selected_features = @character.feats.joins(:feat).where(feats: { origin: 1 }).pluck('feats.slug')

          ::Dc20::Feat.where(origin: 4).select do |talent|
            next false if talent.conditions['level'] > @character.data.level
            next false if talent.info['required_features'] && (talent.info['required_features'] - selected_features).any?

            true
          end
        end
      end
    end
  end
end
