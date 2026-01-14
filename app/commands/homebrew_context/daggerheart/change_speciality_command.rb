# frozen_string_literal: true

module HomebrewContext
  module Daggerheart
    class ChangeSpecialityCommand < BaseCommand
      use_contract do
        config.messages.namespace = :homebrew_speciality

        params do
          required(:speciality).filled(type?: ::Daggerheart::Homebrew::Speciality)
          optional(:name).filled(:string, max_size?: 50)
          optional(:evasion).filled(:integer, gteq?: 1, lteq?: 20)
          optional(:health_max).filled(:integer, gteq?: 1, lteq?: 10)
        end
      end

      private

      def do_persist(input)
        input[:speciality].update!(input.except(:speciality))

        { result: input[:speciality] }
      end
    end
  end
end
