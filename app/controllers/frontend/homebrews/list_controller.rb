# frozen_string_literal: true

module Frontend
  module Homebrews
    class ListController < Frontend::BaseController
      def index
        render json: Panko::Response.new(provider_payload), status: :ok
      end

      private

      def provider_payload
        case params[:provider]
        when 'daggerheart' then daggerheart_payload
        end
      end

      def daggerheart_payload
        {
          races: Panko::ArraySerializer.new(
            ::Daggerheart::Homebrew::Race.where(user_id: current_user.id),
            each_serializer: ::Daggerheart::Homebrew::RaceSerializer
          ).to_a,
          classes: Panko::ArraySerializer.new(
            ::Daggerheart::Homebrew::Speciality.where(user_id: current_user.id),
            each_serializer: ::Daggerheart::Homebrew::SpecialitySerializer
          ).to_a,
          feats: Panko::ArraySerializer.new(
            ::Daggerheart::Feat.where(user_id: current_user.id),
            each_serializer: ::Daggerheart::Homebrew::FeatSerializer
          ).to_a
        }
      end
    end
  end
end
