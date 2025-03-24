# frozen_string_literal: true

module CharactersContext
  module Daggerheart
    class UpdateCommand < BaseCommand
      use_contract do
        config.messages.namespace = :daggerheart_character

        params do
          required(:character).filled(type?: ::Daggerheart::Character)
          optional(:classes).hash
          optional(:traits).hash do
            required(:str).filled(:integer)
            required(:agi).filled(:integer)
            required(:fin).filled(:integer)
            required(:ins).filled(:integer)
            required(:pre).filled(:integer)
            required(:know).filled(:integer)
          end
        end

        rule(:traits) do
          next if value.nil?
          next if value.values.all? { |item| item.between?(-5, 5) }

          key.failure(:invalid_value)
        end
      end

      private

      def do_prepare(input)
        input[:level] = input[:classes].values.sum(&:to_i) if input[:classes]
        %i[classes traits].each do |key|
          input[key]&.transform_values!(&:to_i)
        end
      end

      def do_persist(input)
        input[:character].data = input[:character].data.attributes.merge(input.except(:character).stringify_keys)
        input[:character].save!

        { result: input[:character].reload }
      end
    end
  end
end
