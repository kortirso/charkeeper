# frozen_string_literal: true

module Frontend
  module Cosmere
    module Characters
      class TalentsController < Frontend::BaseController
        include Deps[
          add_feat: 'commands.characters_context.cosmere.feats.add'
        ]
        include SerializeRelation

        before_action :find_character
        before_action :find_feat, only: %i[create]
        before_action :find_feat_for_destroy, only: %i[destroy]

        def index
          render json: {
            feats: CosmereContext::TalentsTree.new.call(
              selected_feat_slugs: selected_feat_slugs
            ),
            selected_talents_count: selected_feat_slugs.size - extra_feats_size
          }, status: :ok
        end

        def create
          case add_feat.call(character: @character, feat: @feat)
          in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
          else only_head_response
          end
        end

        def destroy
          @character.feats.find_by!(feat_id: @feat.id)&.destroy
          only_head_response
        end

        private

        def find_character
          @character = authorized_scope(Character.all).cosmere.find(params[:character_id])
        end

        def find_feat
          @feat = ::Cosmere::Feat.find(params[:feat_id])
        end

        def find_feat_for_destroy
          @feat = ::Cosmere::Feat.find(params[:id])
        end

        def selected_feat_slugs
          @selected_feat_slugs ||= @character.feats.joins(:feat).pluck('feats.slug', 'feats.info').to_h
        end

        def extra_feats_size
          selected_feat_slugs.values.pluck('extra_feats').flatten.compact.size
        end
      end
    end
  end
end
