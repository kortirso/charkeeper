# frozen_string_literal: true

module HomebrewsV2
  module Daggerheart
    class CommunitiesController < Homebrews::BaseController
      include SerializeResource

      before_action :find_community, only: %i[show]
      before_action :find_own_community, only: %i[destroy]
      before_action :find_features, only: %i[show]
      before_action :find_existing_characters, only: %i[destroy]
      before_action :find_another_community, only: %i[copy]

      def show
        serialize_resource(
          @community,
          ::HomebrewsV2::Daggerheart::CommunitySerializer,
          :homebrew,
          {},
          :ok,
          { features: @features }
        )
      end

      def destroy
        @kept ? @community.discard : @community.destroy
        only_head_response
      end

      def copy
        case HomebrewsV2Context::Import::Daggerheart::Communities::CopyCommand.new.call({
          community: @community, user: current_user
        })
        in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
        in { result: result }
          serialize_resource(
            result, ::HomebrewsV2::ListElementSerializer, :homebrew, {}, :created, { current_user_id: current_user.id }
          )
        end
      end

      private

      def find_community
        @community = ::Daggerheart::Homebrews::Community.kept.find(params.expect(:id))
      end

      def find_own_community
        @community = ::Daggerheart::Homebrews::Community.kept.find_by!(id: params.expect(:id), user_id: current_user.id)
      end

      def find_features
        @features = ::Daggerheart::Feat.where(origin_value: @community.id).order(created_at: :asc)
      end

      def find_another_community
        @community =
          ::Daggerheart::Homebrews::Community.kept.where.not(user_id: current_user.id).find(params.expect(:id))
      end

      def find_existing_characters
        return unless characters_relation.exists?(["data ->> 'community' = ?", @community.id])

        @kept = true
      end

      def characters_relation
        ::Daggerheart::Character.where(user_id: current_user.id)
      end
    end
  end
end
