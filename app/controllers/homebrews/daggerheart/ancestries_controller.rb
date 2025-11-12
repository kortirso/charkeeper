# frozen_string_literal: true

module Homebrews
  module Daggerheart
    class AncestriesController < Homebrews::BaseController
      include Deps[
        add_daggerheart_race: 'commands.homebrew_context.daggerheart.add_race',
        change_daggerheart_race: 'commands.homebrew_context.daggerheart.change_race'
      ]
      include SerializeRelation
      include SerializeResource

      before_action :find_ancestries, only: %i[index]
      before_action :find_ancestry, only: %i[show update destroy]
      before_action :find_features, only: %i[index show]
      before_action :find_existing_characters, only: %i[destroy]

      def index
        serialize_relation(
          @ancestries,
          ::Homebrews::Daggerheart::AncestrySerializer,
          :ancestries,
          {},
          { features: @features }
        )
      end

      def show
        serialize_resource(
          @ancestry, ::Homebrews::Daggerheart::AncestrySerializer, :ancestry, {}, :ok, { features: @features }
        )
      end

      def create
        case add_daggerheart_race.call(ancestry_params.merge(user: current_user))
        in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
        in { result: result }
          serialize_resource(result, ::Homebrews::Daggerheart::AncestrySerializer, :ancestry, {}, :created)
        end
      end

      def update
        case change_daggerheart_race.call(ancestry_params.merge(ancestry: @ancestry))
        in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
        in { result: result }
          serialize_resource(result, ::Homebrews::Daggerheart::AncestrySerializer, :ancestry, {}, :ok)
        end
      end

      def destroy
        @ancestry.destroy
        only_head_response
      end

      private

      def find_ancestries
        @ancestries = ::Daggerheart::Homebrew::Race.where(user_id: current_user.id).order(created_at: :desc)
      end

      def find_features
        @features =
          ::Daggerheart::Feat.where(origin_value: @ancestries ? @ancestries.pluck(:id) : @ancestry.id).order(created_at: :asc)
      end

      def find_ancestry
        @ancestry = ::Daggerheart::Homebrew::Race.find_by!(id: params[:id], user_id: current_user.id)
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
