# frozen_string_literal: true

module HomebrewsV2
  module Daggerheart
    class SubclassesController < Homebrews::BaseController
      include SerializeResource

      before_action :find_subclass, only: %i[show]
      before_action :find_own_subclass, only: %i[destroy]
      before_action :find_features, only: %i[show]
      before_action :find_existing_characters, only: %i[destroy]
      before_action :find_another_subclass, only: %i[copy]

      def show
        serialize_resource(
          @subclass,
          ::HomebrewsV2::Daggerheart::SubclassSerializer,
          :homebrew,
          {},
          :ok,
          { features: @features }
        )
      end

      def destroy
        @kept ? @subclass.discard : @subclass.destroy
        only_head_response
      end

      def copy
        case HomebrewsV2Context::Import::Daggerheart::Subclasses::CopyCommand.new.call({
          subclass: @subclass, user: current_user
        })
        in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
        in { result: result }
          serialize_resource(
            result, ::HomebrewsV2::ListElementSerializer, :homebrew, {}, :created, { current_user_id: current_user.id }
          )
        end
      end

      private

      def find_subclass
        @subclass = ::Daggerheart::Homebrews::Subclass.kept.find(params.expect(:id))
      end

      def find_own_subclass
        @subclass = ::Daggerheart::Homebrews::Subclass.kept.find_by!(id: params.expect(:id), user_id: current_user.id)
      end

      def find_features
        @features = ::Daggerheart::Feat.where(origin_value: @subclass.id).order(created_at: :asc)
      end

      def find_another_subclass
        @ancestry =
          ::Daggerheart::Homebrews::Subclass.kept.where.not(user_id: current_user.id).find(params.expect(:id))
      end

      def find_existing_characters
        subclasses = ::Daggerheart::Character.pluck(:data).pluck(:subclasses)
        return if subclasses.flat_map(&:values).exclude?(@subclass.id)

        @kept = true
      end

      def characters_relation
        ::Daggerheart::Character.where(user_id: current_user.id)
      end
    end
  end
end
