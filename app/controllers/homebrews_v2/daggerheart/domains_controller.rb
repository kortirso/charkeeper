# frozen_string_literal: true

module HomebrewsV2
  module Daggerheart
    class DomainsController < HomebrewsV2::HomebrewController
      include SerializeResource

      private

      def class_name = ::Daggerheart::Homebrews::Domain
      def serializer = ::HomebrewsV2::Daggerheart::DomainSerializer

      def copy_command
        HomebrewsV2Context::Import::Daggerheart::Domains::CopyCommand.new.call({
          domain: @element, user: current_user
        })
      end

      def find_existing_characters
        @kept = true
      end
    end
  end
end
