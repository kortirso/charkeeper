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
        before_action :find_character_feat, only: %i[destroy]

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

        def destroy
          @character_feat.destroy
          only_head_response
        end

        private

        def cache_options
          { key: "feats/#{params[:provider]}/#{I18n.locale}/v0.4.24", expires_in: 1.day }
        end

        def find_character
          @character = authorized_scope(Character.all).pathfinder2.find(params[:character_id])
        end

        def find_character_feat
          @character_feat = @character.feats.find(params[:id])
        end

        def character_feats
          keys = @character.data.selected_feats.keys
          selected_feats = @character.data.selected_feats

          @character
            .feats.joins(:feat)
            .where(feats: { origin: [0, 1, 2, 3] })
            .filter_map do |character_feat|
              next if keys.exclude?(character_feat.feat_id)

              value = selected_feats.dig(character_feat.feat_id, 0)
              feat = ::Pathfinder2::FeatSerializer.new.serialize(character_feat.feat)
              {
                id: character_feat.id,
                level: value['level'],
                type: value['type'],
                feat: feat
              }
            end
        end

        def tags
          check_cache_value({ key: "feat_tags/#{params[:provider]}/#{I18n.locale}/v0.4.24", expires_in: 1.day }) do
            ::Pathfinder2::Feat.where(origin: [0, 1, 2, 3]).pluck(:origin_values).flatten.uniq.index_with do |item|
              I18n.t("tags.pathfinder.general.#{item}")
            end
          end
        end

        def relation
          ::Pathfinder2::Feat.where(origin: [0, 1, 2, 3])
        end

        def create_params
          params.require(:feat).permit!.to_h
        end
      end
    end
  end
end
