# frozen_string_literal: true

module Homebrews
  module Daggerheart
    class SubclassesController < Homebrews::BaseController
      include Deps[
        add_daggerheart_subclass: 'commands.homebrew_context.daggerheart.add_subclass',
        change_daggerheart_subclass: 'commands.homebrew_context.daggerheart.change_subclass',
        copy_subclass: 'commands.homebrew_context.daggerheart.copy_subclass'
      ]
      include SerializeRelation
      include SerializeResource

      before_action :find_subclasses, only: %i[index]
      before_action :find_subclass, only: %i[show update destroy]
      before_action :find_features, only: %i[index show]
      before_action :find_feature_bonuses, only: %i[index show]
      before_action :find_existing_characters, only: %i[destroy]
      before_action :find_another_subclass, only: %i[copy]

      def index
        serialize_relation(
          @subclasses,
          ::Homebrews::Daggerheart::SubclassSerializer,
          :subclasses,
          {},
          { features: @features, bonuses: @bonuses, current_user_id: current_user.id }
        )
      end

      def show
        serialize_resource(
          @subclass,
          ::Homebrews::Daggerheart::SubclassSerializer,
          :subclass,
          {},
          :ok,
          { features: @features, bonuses: @bonuses }
        )
      end

      def create
        case add_daggerheart_subclass.call(subclass_params.merge(user: current_user))
        in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
        in { result: result }
          serialize_resource(result, ::Homebrews::Daggerheart::SubclassSerializer, :subclass, {}, :created)
        end
      end

      def update
        case change_daggerheart_subclass.call(subclass_params.merge(subclass: @subclass))
        in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
        in { result: result }
          serialize_resource(result, ::Homebrews::Daggerheart::SubclassSerializer, :subclass, {}, :ok)
        end
      end

      def destroy
        @subclass.destroy
        only_head_response
      end

      def copy
        case copy_subclass.call({ subclass: @subclass, user: current_user })
        in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
        in { result: result }
          serialize_resource(result, ::Homebrews::Daggerheart::SubclassSerializer, :subclass, {}, :created)
        end
      end

      private

      def find_subclasses
        @subclasses =
          ::Daggerheart::Homebrew::Subclass.where(user_id: current_user.id)
            .or(
              ::Daggerheart::Homebrew::Subclass.where.not(user_id: current_user.id).where(public: true)
            ).order(created_at: :desc)
      end

      def find_features
        @features =
          ::Daggerheart::Feat
            .where(origin_value: @subclasses ? @subclasses.pluck(:id) : @subclass.id)
            .order(created_at: :asc)
      end

      def find_feature_bonuses
        @bonuses = Character::Bonus.where(bonusable: @features.pluck(:id))
      end

      def find_subclass
        @subclass = ::Daggerheart::Homebrew::Subclass.find_by!(id: params[:id], user_id: current_user.id)
      end

      def find_another_subclass
        @subclass = ::Daggerheart::Homebrew::Subclass.where.not(user_id: current_user.id).find(params[:id])
      end

      def find_existing_characters
        subclasses = ::Daggerheart::Character.where(user_id: current_user.id).pluck(:data).pluck(:subclasses)
        return if subclasses.flat_map(&:values).exclude?(@subclass.id)

        unprocessable_response(
          { base: [t('frontend.homebrews.subclasses.daggerheart.character_exists')] },
          [t('frontend.homebrews.subclasses.daggerheart.character_exists')]
        )
      end

      def subclass_params
        params.require(:brewery).permit!.to_h
      end
    end
  end
end
