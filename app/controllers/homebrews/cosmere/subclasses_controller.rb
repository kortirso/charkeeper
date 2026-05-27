# frozen_string_literal: true

module Homebrews
  module Cosmere
    class SubclassesController < Homebrews::BaseController
      include SerializeRelation

      before_action :find_subclasses, only: %i[index]

      def index
        serialize_relation(
          @subclasses,
          ::Homebrews::Cosmere::SubclassSerializer,
          :subclasses,
          {},
          { current_user_id: current_user.id }
        )
      end

      private

      def find_subclasses
        @subclasses =
          ::Cosmere::Homebrew::Subclass.where(user_id: current_user.id)
            .or(
              ::Cosmere::Homebrew::Subclass.where.not(user_id: current_user.id).where(public: true)
            ).kept.order(created_at: :desc)
      end
    end
  end
end
