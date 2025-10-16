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
        when 'dnd2024' then dnd2024_payload
        end
      end

      def daggerheart_payload # rubocop: disable Metrics/AbcSize
        {
          races: Panko::ArraySerializer.new(races, each_serializer: ::Daggerheart::Homebrew::RaceSerializer).to_a,
          communities: Panko::ArraySerializer.new(comms, each_serializer: ::Daggerheart::Homebrew::CommunitySerializer).to_a,
          transformations: Panko::ArraySerializer.new(transformations, each_serializer: ::Daggerheart::Homebrew::TransformationSerializer).to_a,
          domains: Panko::ArraySerializer.new(domains, each_serializer: ::Daggerheart::Homebrew::DomainSerializer).to_a,
          classes: Panko::ArraySerializer.new(classes, each_serializer: ::Daggerheart::Homebrew::SpecialitySerializer).to_a,
          subclasses: Panko::ArraySerializer.new(subclasses, each_serializer: ::Daggerheart::Homebrew::SubclassSerializer).to_a,
          feats: Panko::ArraySerializer.new(feats, each_serializer: ::Daggerheart::Homebrew::FeatSerializer).to_a,
          items: Panko::ArraySerializer.new(items, each_serializer: ::Daggerheart::Homebrew::ItemSerializer).to_a
        }
      end

      def dnd2024_payload
        {
          races: Panko::ArraySerializer.new(dnd2024_races, each_serializer: ::Dnd2024::Homebrew::RaceSerializer).to_a
        }
      end

      def races = ::Daggerheart::Homebrew::Race.where(user_id: current_user.id).order(name: :asc)
      def comms = ::Daggerheart::Homebrew::Community.where(user_id: current_user.id).order(name: :asc)
      def transformations = ::Daggerheart::Homebrew::Transformation.where(user_id: current_user.id).order(name: :asc)
      def domains = ::Daggerheart::Homebrew::Domain.where(user_id: current_user.id).order(name: :asc)
      def classes = ::Daggerheart::Homebrew::Speciality.where(user_id: current_user.id).order(name: :asc)
      def subclasses = ::Daggerheart::Homebrew::Subclass.where(user_id: current_user.id).order(name: :asc)
      def feats = ::Daggerheart::Feat.where(user_id: current_user.id).order(Arel.sql("title->>'en' ASC"))
      def items = ::Daggerheart::Item.where(user_id: current_user.id).order(Arel.sql("name->>'en' ASC"))

      def dnd2024_races = ::Dnd2024::Homebrew::Race.where(user_id: current_user.id).order(name: :asc)
    end
  end
end
