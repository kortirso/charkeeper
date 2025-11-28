# frozen_string_literal: true

module HomebrewContext
  module Daggerheart
    class AddSpecialityCommand < BaseCommand
      use_contract do
        config.messages.namespace = :homebrew_speciality

        params do
          required(:user).filled(type?: ::User)
          required(:name).filled(:string, max_size?: 50)
          required(:domains).filled(:array).each(:string)
          required(:evasion).filled(:integer, gteq?: 1, lteq?: 20)
          required(:health_max).filled(:integer, gteq?: 1, lteq?: 10)
        end

        rule(:domains) do
          key.failure(:only_two) if value.size != 2
        end
      end

      private

      def do_prepare(input)
        input[:attributes] = input.slice(:user, :name)
        input[:data] = { data: input.slice(:domains, :evasion, :health_max) }
      end

      def do_persist(input)
        result = ::Daggerheart::Homebrew::Speciality.create!(input[:attributes].merge(input[:data]))

        { result: result }
      end
    end
  end
end
