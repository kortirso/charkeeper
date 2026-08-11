# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Nimble
      module Feats
        class AddCommand < BaseCommand
          use_contract do
            Origins = Dry::Types['strict.string'].enum('ancestry')

            params do
              required(:user).filled(type?: ::User)
              required(:title).hash
              required(:description).hash
              required(:origin).filled(Origins)
              required(:origin_value).filled(:string)
              required(:kind).filled(:string)
              optional(:limit).filled(:string)
              optional(:limit_refresh).filled(:string)
              optional(:modifiers).hash
              optional(:continious).filled(:bool)
              optional(:exclude).maybe(:array).each(:string, :uuid_v4?)
            end
          end

          private

          def do_prepare(input)
            input[:slug] = SecureRandom.uuid
            input[:info] = {}
            input[:info][:limit] = input[:limit] if input.key?(:limit)
            input[:title].transform_values! { |value| sanitize(value) }
            input[:description].transform_values! { |value| sanitize(value) }
          end

          def do_persist(input)
            result = ::Nimble::Feat.create!(
              input.except(:limit, :skip_contract_validation)
            )

            { result: result }
          end
        end
      end
    end
  end
end
