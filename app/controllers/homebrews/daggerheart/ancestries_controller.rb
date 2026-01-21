# frozen_string_literal: true

module Homebrews
  module Daggerheart
    class AncestriesController < Homebrews::BaseController
      include Deps[
        add_race: 'commands.homebrew_context.daggerheart.add_race',
        change_race: 'commands.homebrew_context.daggerheart.change_race',
        copy_race: 'commands.homebrew_context.daggerheart.copy_race'
      ]
      include SerializeRelation
      include SerializeResource

      before_action :find_ancestries, only: %i[index]
      before_action :find_ancestry, only: %i[show update destroy]
      before_action :find_features, only: %i[index show]
      before_action :find_feature_bonuses, only: %i[index show]
      before_action :find_existing_characters, only: %i[destroy]
      before_action :find_another_ancestry, only: %i[copy]

      def index
        serialize_relation(
          @ancestries,
          ::Homebrews::Daggerheart::AncestrySerializer,
          :ancestries,
          {},
          { features: @features, bonuses: @bonuses, current_user_id: current_user.id }
        )
      end

      def show
        serialize_resource(
          @ancestry,
          ::Homebrews::Daggerheart::AncestrySerializer,
          :ancestry,
          {},
          :ok,
          { features: @features, bonuses: @bonuses, current_user_id: current_user.id }
        )
      end

      def create
        case add_race.call(ancestry_params.merge(user: current_user))
        in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
        in { result: result }
          serialize_resource(
            result, ::Homebrews::Daggerheart::AncestrySerializer, :ancestry, {}, :created, { current_user_id: current_user.id }
          )
        end
      end

      def update
        case change_race.call(ancestry_params.merge(ancestry: @ancestry))
        in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
        in { result: result }
          serialize_resource(result, ::Homebrews::Daggerheart::AncestrySerializer, :ancestry, {}, :ok)
        end
      end

      def destroy
        @ancestry.destroy
        only_head_response
      end

      def copy
        case copy_race.call({ race: @ancestry, user: current_user })
        in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
        in { result: result }
          serialize_resource(result, ::Homebrews::Daggerheart::AncestrySerializer, :ancestry, {}, :created)
        end
      end

      private

      def find_ancestries
        @ancestries =
          ::Daggerheart::Homebrew::Race.where(user_id: current_user.id)
            .or(
              ::Daggerheart::Homebrew::Race.where.not(user_id: current_user.id).where(public: true)
            ).order(created_at: :desc)
      end

      def find_features
        @features =
          ::Daggerheart::Feat
            .where(origin_value: @ancestries ? @ancestries.pluck(:id) : @ancestry.id)
            .order(created_at: :asc)
      end

      def find_feature_bonuses
        @bonuses = Character::Bonus.where(bonusable: @features.pluck(:id))
      end

      def find_ancestry
        @ancestry = ::Daggerheart::Homebrew::Race.find_by!(id: params[:id], user_id: current_user.id)
      end

      def find_another_ancestry
        @ancestry = ::Daggerheart::Homebrew::Race.where.not(user_id: current_user.id).find(params[:id])
      end

      def find_existing_characters
        return unless ::Daggerheart::Character.where(user_id: current_user.id).exists?(["data ->> 'heritage' = ?", @ancestry.id])

        unprocessable_response(
          { base: [t('frontend.homebrews.races.daggerheart.character_exists')] },
          [t('frontend.homebrews.races.daggerheart.character_exists')]
        )
      end

      def ancestry_params
        params.require(:brewery).permit!.to_h
      end
    end
  end
end
