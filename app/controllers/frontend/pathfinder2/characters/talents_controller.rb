# frozen_string_literal: true

module Frontend
  module Pathfinder2
    module Characters
      class TalentsController < Frontend::BaseController
        include Deps[
          add_feat: 'commands.characters_context.pathfinder2.feats.add'
        ]
        include SerializeRelation
        include SerializeResource

        before_action :find_character

        def index
          render json: {
            feats: relation_to_json(relation, ::Pathfinder2::FeatSerializer, cache_options: cache_options),
            character_feats: character_feats,
            tags: tags
          }, status: :ok
        end

        def create
          case add_feat.call(create_params.merge({ character: @character }))
          in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
          else only_head_response
          end
        end

        private

        def cache_options
          { key: "feats/#{params[:provider]}/#{I18n.locale}/v2", expires_in: 1.day }
        end

        def find_character
          @character = authorized_scope(Character.all).pathfinder2.find(params[:character_id])
        end

        def character_feats
          feats = ::Pathfinder2::Feat.where(id: @character.data.selected_feats.keys).to_a
          @character.data.selected_feats.flat_map do |(key, values)|
            feat = ::Pathfinder2::FeatSerializer.new.serialize(feats.find { |item| item.id == key })
            values.map do |value|
              {
                level: value['level'],
                type: value['type'],
                feat: feat
              }
            end
          end
        end

        def tags
          check_cache_value({ key: "feat_tags/#{params[:provider]}/#{I18n.locale}/v2", expires_in: 1.day }) do
            ::Pathfinder2::Feat.pluck(:origin_values).flatten.uniq.index_with do |item|
              I18n.t("tags.pathfinder.general.#{item}")
            end
          end
        end

        def relation
          ::Pathfinder2::Feat.all
          # .where("conditions ->> 'level' IN (?)", (0..@character.data.level).to_a.map(&:to_s))
        end

        def create_params
          params.require(:feat).permit!.to_h
        end
      end
    end
  end
end
