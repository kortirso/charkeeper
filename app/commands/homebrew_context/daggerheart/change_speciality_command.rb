# frozen_string_literal: true

module HomebrewContext
  module Daggerheart
    class ChangeSpecialityCommand < BaseCommand
      use_contract do
        config.messages.namespace = :homebrew_speciality

        params do
          required(:speciality).filled(type?: ::Daggerheart::Homebrew::Speciality)
          optional(:name).filled(:string, max_size?: 50)
        end
      end

      private

      def do_persist(input)
        input[:speciality].update!(input.slice(:name))

        { result: input[:speciality] }
      end
    end
  end
end
