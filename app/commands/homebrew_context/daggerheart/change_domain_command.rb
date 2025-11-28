# frozen_string_literal: true

module HomebrewContext
  module Daggerheart
    class ChangeDomainCommand < BaseCommand
      use_contract do
        config.messages.namespace = :homebrew_domain

        params do
          required(:domain).filled(type?: ::Daggerheart::Homebrew::Domain)
          optional(:name).filled(:string, max_size?: 50)
          optional(:public).filled(:bool)
        end
      end

      private

      def do_persist(input)
        input[:domain].update!(input.slice(:name, :public))

        { result: input[:domain] }
      end
    end
  end
end
