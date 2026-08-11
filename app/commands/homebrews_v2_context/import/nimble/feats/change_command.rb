# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Nimble
      module Feats
        class ChangeCommand < BaseCommand
          private

          def do_prepare(input) # rubocop: disable Metrics/AbcSize
            input[:info] = {}

            input[:info][:limit] = input[:limit] if input.key?(:limit)
            input[:title].transform_values! { |value| sanitize(value) }
            input[:description].transform_values! { |value| sanitize(value) }

            input[:attributes] = input.except(:feat, :limit, :skip_contract_validation)
            input[:attributes][:modifiers] = {} unless input.key?(:modifiers)
            input[:attributes][:tokens] = nil unless input.key?(:tokens)
            input[:attributes][:continious] = false unless input.key?(:continious)
          end

          def do_persist(input)
            input[:feat].update!(input[:attributes])
            input[:feat].character_feats.update_all(tokens: input[:feat].tokens.nil? ? nil : 0)

            { result: :ok }
          end
        end
      end
    end
  end
end
