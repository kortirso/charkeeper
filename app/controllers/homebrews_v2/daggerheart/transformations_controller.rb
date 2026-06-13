# frozen_string_literal: true

module HomebrewsV2
  module Daggerheart
    class TransformationsController < Homebrews::BaseController
      include SerializeResource

      before_action :find_transformation, only: %i[show]
      before_action :find_own_transformation, only: %i[destroy]
      before_action :find_features, only: %i[show]
      before_action :find_existing_characters, only: %i[destroy]
      before_action :find_another_transformation, only: %i[copy]

      def show
        serialize_resource(
          @transformation,
          ::HomebrewsV2::Daggerheart::TransformationSerializer,
          :homebrew,
          {},
          :ok,
          { features: @features }
        )
      end

      def destroy
        @kept ? @transformation.discard : @transformation.destroy
        only_head_response
      end

      def copy
        case HomebrewsV2Context::Import::Daggerheart::Transformations::CopyCommand.new.call({
          transformation: @transformation, user: current_user
        })
        in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
        in { result: result }
          serialize_resource(result, ::HomebrewsV2::ListElementSerializer, :homebrew, {}, :created)
        end
      end

      private

      def find_transformation
        @transformation = ::Daggerheart::Homebrews::Transformation.kept.find(params.expect(:id))
      end

      def find_own_transformation
        @transformation = ::Daggerheart::Homebrews::Transformation.kept.find_by!(id: params.expect(:id), user_id: current_user.id)
      end

      def find_features
        @features = ::Daggerheart::Feat.where(origin_value: @transformation.id).order(created_at: :asc)
      end

      def find_another_transformation
        @transformation =
          ::Daggerheart::Homebrews::Transformation.kept.where.not(user_id: current_user.id).find(params.expect(:id))
      end

      def find_existing_characters
        return unless characters_relation.exists?(["data ->> 'transformation' = ?", @transformation.id])

        @kept = true
      end

      def characters_relation
        ::Daggerheart::Character.where(user_id: current_user.id)
      end
    end
  end
end
