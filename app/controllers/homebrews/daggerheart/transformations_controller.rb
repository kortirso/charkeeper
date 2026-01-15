# frozen_string_literal: true

module Homebrews
  module Daggerheart
    class TransformationsController < Homebrews::BaseController
      include Deps[
        add_daggerheart_transformation: 'commands.homebrew_context.daggerheart.transformations.add',
        change_daggerheart_transformation: 'commands.homebrew_context.daggerheart.transformations.change'
      ]
      include SerializeRelation
      include SerializeResource

      before_action :find_transformations, only: %i[index]
      before_action :find_transformation, only: %i[show update destroy]
      before_action :find_features, only: %i[index show]
      before_action :find_feature_bonuses, only: %i[index show]
      before_action :find_existing_characters, only: %i[destroy]

      def index
        serialize_relation(
          @transformations,
          ::Homebrews::Daggerheart::TransformationSerializer,
          :transformations,
          {},
          { features: @features, bonuses: @bonuses }
        )
      end

      def show
        serialize_resource(
          @transformation,
          ::Homebrews::Daggerheart::TransformationSerializer,
          :transformation,
          {},
          :ok,
          { features: @features, bonuses: @bonuses }
        )
      end

      def create
        case add_daggerheart_transformation.call(transformation_params.merge(user: current_user))
        in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
        in { result: result }
          serialize_resource(result, ::Homebrews::Daggerheart::TransformationSerializer, :transformation, {}, :created)
        end
      end

      def update
        case change_daggerheart_transformation.call(transformation_params.merge(transformation: @transformation))
        in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
        in { result: result }
          serialize_resource(result, ::Homebrews::Daggerheart::TransformationSerializer, :transformation, {}, :ok)
        end
      end

      def destroy
        @transformation.destroy
        only_head_response
      end

      private

      def find_transformations
        @transformations = ::Daggerheart::Homebrew::Transformation.where(user_id: current_user.id).order(created_at: :desc)
      end

      def find_features
        @features =
          ::Daggerheart::Feat
            .where(origin_value: @transformations ? @transformations.pluck(:id) : @transformation.id)
            .order(created_at: :asc)
      end

      def find_feature_bonuses
        @bonuses = Character::Bonus.where(bonusable: @features.pluck(:id))
      end

      def find_transformation
        @transformation = ::Daggerheart::Homebrew::Transformation.find_by!(id: params[:id], user_id: current_user.id)
      end

      def find_existing_characters
        return unless characters_relation.exists?(["data ->> 'transformation' = ?", @transformation.id])

        unprocessable_response(
          { base: [t('frontend.homebrews.transformations.daggerheart.character_exists')] },
          [t('frontend.homebrews.transformations.daggerheart.character_exists')]
        )
      end

      def characters_relation
        ::Daggerheart::Character.where(user_id: current_user.id)
      end

      def transformation_params
        params.require(:brewery).permit!.to_h
      end
    end
  end
end
