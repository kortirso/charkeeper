# frozen_string_literal: true

module Homebrews
  module Daggerheart
    class CommunitiesController < Homebrews::BaseController
      include Deps[
        add_daggerheart_community: 'commands.homebrew_context.daggerheart.add_community',
        change_daggerheart_community: 'commands.homebrew_context.daggerheart.change_community',
        copy_community: 'commands.homebrew_context.daggerheart.copy_community'
      ]
      include SerializeRelation
      include SerializeResource

      before_action :find_communities, only: %i[index]
      before_action :find_community, only: %i[show update destroy]
      before_action :find_features, only: %i[index show]
      before_action :find_feature_bonuses, only: %i[index show]
      before_action :find_existing_characters, only: %i[destroy]
      before_action :find_another_community, only: %i[copy]

      def index
        serialize_relation(
          @communities,
          ::Homebrews::Daggerheart::CommunitySerializer,
          :communities,
          {},
          { features: @features, bonuses: @bonuses, current_user_id: current_user.id }
        )
      end

      def show
        serialize_resource(
          @community, ::Homebrews::Daggerheart::CommunitySerializer, :community, {}, :ok, { features: @features, bonuses: @bonuses }
        )
      end

      def create
        case add_daggerheart_community.call(community_params.merge(user: current_user))
        in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
        in { result: result }
          serialize_resource(
            result, ::Homebrews::Daggerheart::CommunitySerializer, :community, {}, :created, { current_user_id: current_user.id }
          )
        end
      end

      def update
        case change_daggerheart_community.call(community_params.merge(community: @community))
        in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
        in { result: result }
          serialize_resource(result, ::Homebrews::Daggerheart::CommunitySerializer, :community, {}, :ok)
        end
      end

      def destroy
        @community.destroy
        only_head_response
      end

      def copy
        case copy_community.call({ community: @community, user: current_user })
        in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
        in { result: result }
          serialize_resource(result, ::Homebrews::Daggerheart::CommunitySerializer, :community, {}, :created)
        end
      end

      private

      def find_communities
        @communities =
          ::Daggerheart::Homebrew::Community.where(user_id: current_user.id)
            .or(
              ::Daggerheart::Homebrew::Community.where.not(user_id: current_user.id).where(public: true)
            ).order(created_at: :desc)
      end

      def find_features
        @features =
          ::Daggerheart::Feat.where(origin_value: @communities ? @communities.pluck(:id) : @community.id).order(created_at: :asc)
      end

      def find_feature_bonuses
        @bonuses = Character::Bonus.where(bonusable: @features.pluck(:id))
      end

      def find_community
        @community = ::Daggerheart::Homebrew::Community.find_by!(id: params[:id], user_id: current_user.id)
      end

      def find_another_community
        @community = ::Daggerheart::Homebrew::Community.where.not(user_id: current_user.id).find(params[:id])
      end

      def find_existing_characters
        unless ::Daggerheart::Character.where(user_id: current_user.id).exists?(["data ->> 'community' = ?", @community.id])
          return
        end

        unprocessable_response(
          { base: [t('frontend.homebrews.communities.daggerheart.character_exists')] },
          [t('frontend.homebrews.communities.daggerheart.character_exists')]
        )
      end

      def community_params
        params.require(:brewery).permit!.to_h
      end
    end
  end
end
