# frozen_string_literal: true

module Homebrews
  module Cosmere
    class SpecialitiesController < Homebrews::BaseController
      include SerializeRelation
      include SerializeResource

      before_action :find_specialities, only: %i[index]

      def index
        serialize_relation(
          @specialities,
          ::Homebrews::Cosmere::SpecialitySerializer,
          :specialities,
          {},
          { current_user_id: current_user.id }
        )
      end

      def create
        case add_speciality.call(speciality_params.merge(user: current_user))
        in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
        in { result: result }
          serialize_resource(
            result, ::Homebrews::Cosmere::SpecialitySerializer, :speciality, {}, :created, { current_user_id: current_user.id }
          )
        end
      end

      private

      def find_specialities
        @specialities =
          ::Cosmere::Homebrew::Speciality.where(user_id: current_user.id)
            .or(
              ::Cosmere::Homebrew::Speciality.where.not(user_id: current_user.id).where(public: true)
            ).kept.order(created_at: :desc)
      end

      def speciality_params
        params.require(:brewery).permit!.to_h
      end

      def add_speciality = ::HomebrewContext::Cosmere::Specialities::AddCommand.new
    end
  end
end
