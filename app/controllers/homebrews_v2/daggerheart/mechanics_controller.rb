# frozen_string_literal: true

module HomebrewsV2
  module Daggerheart
    class MechanicsController < HomebrewsV2::HomebrewController
      include SerializeResource

      private

      def class_name = ::Daggerheart::Homebrews::Mechanic
      def serializer = ::HomebrewsV2::Daggerheart::MechanicSerializer
      def feat_class = ::Daggerheart::Feat
      def character_class = ::Daggerheart::Character

      def find_existing_characters
        @kept = true
      end

      def find_features
        @features = feat_class.where(origin_value: @element.items.pluck(:id)).includes(:items).order(created_at: :asc)
      end
    end
  end
end
