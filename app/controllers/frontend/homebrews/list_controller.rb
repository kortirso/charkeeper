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
          races: Panko::ArraySerializer.new(races, each_serializer: ::Daggerheart::Homebrew::RaceSerializer).to_a,
          classes: Panko::ArraySerializer.new(classes, each_serializer: ::Daggerheart::Homebrew::SpecialitySerializer).to_a,
          subclasses: Panko::ArraySerializer.new(subclasses, each_serializer: ::Daggerheart::Homebrew::SubclassSerializer).to_a,
          feats: Panko::ArraySerializer.new(feats, each_serializer: ::Daggerheart::Homebrew::FeatSerializer).to_a
        }
      end

      def races = ::Daggerheart::Homebrew::Race.where(user_id: current_user.id).order(name: :asc)
      def classes = ::Daggerheart::Homebrew::Speciality.where(user_id: current_user.id).order(name: :asc)
      def subclasses = ::Daggerheart::Homebrew::Subclass.where(user_id: current_user.id).order(name: :asc)
      def feats = ::Daggerheart::Feat.where(user_id: current_user.id).order(Arel.sql("title->>'en' ASC"))
    end
  end
end
