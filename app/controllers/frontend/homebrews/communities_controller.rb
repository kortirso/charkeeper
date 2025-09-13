# frozen_string_literal: true

module Frontend
  module Homebrews
    class CommunitiesController < Frontend::BaseController
      before_action :find_community, only: %i[destroy]
      before_action :find_existing_characters, only: %i[destroy]

      def destroy
        @community.destroy
        only_head_response
      end

      private

      def find_community
        @community = communities_relation.find_by!(id: params[:id], user_id: current_user.id)
      end

      def find_existing_characters
        return unless characters_relation.where(user_id: current_user.id).exists?(["data ->> 'community' = ?", @community.id])

        unprocessable_response(
          { base: [t("frontend.homebrews.communities.#{params[:provider]}.character_exists")] },
          [t("frontend.homebrews.communities.#{params[:provider]}.character_exists")]
        )
      end

      def communities_relation
        case params[:provider]
        when 'daggerheart' then ::Daggerheart::Homebrew::Community
        else []
        end
      end

      def characters_relation
        case params[:provider]
        when 'daggerheart' then ::Daggerheart::Character
        end
      end
    end
  end
end
