# frozen_string_literal: true

module Homebrews
  module Daggerheart
    class SpecialitiesController < Homebrews::BaseController
      include Deps[
        add_daggerheart_speciality: 'commands.homebrew_context.daggerheart.add_speciality',
        change_daggerheart_speciality: 'commands.homebrew_context.daggerheart.change_speciality'
      ]
      include SerializeRelation
      include SerializeResource

      before_action :find_specialities, only: %i[index]
      before_action :find_speciality, only: %i[show update destroy]
      before_action :find_features, only: %i[index show]
      before_action :find_feature_bonuses, only: %i[index show]
      before_action :find_existing_characters, only: %i[destroy]

      def index
        serialize_relation(
          @specialities,
          ::Homebrews::Daggerheart::SpecialitySerializer,
          :specialities,
          {},
          { features: @features, bonuses: @bonuses }
        )
      end

      def show
        serialize_resource(
          @speciality,
          ::Homebrews::Daggerheart::SpecialitySerializer,
          :speciality,
          {},
          :ok,
          { features: @features, bonuses: @bonuses }
        )
      end

      def create
        case add_daggerheart_speciality.call(speciality_params.merge(user: current_user))
        in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
        in { result: result }
          serialize_resource(result, ::Homebrews::Daggerheart::SpecialitySerializer, :speciality, {}, :created)
        end
      end

      def update
        case change_daggerheart_speciality.call(speciality_params.merge(speciality: @speciality))
        in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
        in { result: result }
          serialize_resource(result, ::Homebrews::Daggerheart::SpecialitySerializer, :speciality, {}, :ok)
        end
      end

      def destroy
        @speciality.destroy
        only_head_response
      end

      private

      def find_specialities
        @specialities = ::Daggerheart::Homebrew::Speciality.where(user_id: current_user.id).order(created_at: :desc)
      end

      def find_features
        @features =
          ::Daggerheart::Feat
            .where(origin_value: @specialities ? @specialities.pluck(:id) : @speciality.id)
            .order(created_at: :asc)
      end

      def find_feature_bonuses
        @bonuses = Character::Bonus.where(bonusable: @features.pluck(:id))
      end

      def find_speciality
        @speciality = ::Daggerheart::Homebrew::Speciality.find_by!(id: params[:id], user_id: current_user.id)
      end

      def find_existing_characters
        subclasses = ::Daggerheart::Character.where(user_id: current_user.id).pluck(:data).pluck(:subclasses)
        return if subclasses.flat_map(&:keys).exclude?(@speciality.id)

        unprocessable_response(
          { base: [t("frontend.homebrews.specialities.#{params[:provider]}.character_exists")] },
          [t("frontend.homebrews.specialities.#{params[:provider]}.character_exists")]
        )
      end

      def speciality_params
        params.require(:brewery).permit!.to_h
      end
    end
  end
end
