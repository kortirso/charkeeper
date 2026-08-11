# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Nimble
      module Ancestries
        class PerformCommand < BaseCommand
          # rubocop: disable Metrics/BlockLength
          use_contract do
            Kinds = Dry::Types['strict.string'].enum('static', 'text', 'update_result', 'hidden')
            Limits = Dry::Types['strict.string'].enum('combat_rest', 'field_rest', 'long_field_rest', 'safe_rest')

            params do
              required(:user).filled(type?: ::User)
              optional(:id).filled(:string, :uuid_v4?)
              required(:title).hash do
                required(:en).filled(:string, max_size?: 50)
                optional(:ru).maybe(:string, max_size?: 50)
                optional(:es).maybe(:string, max_size?: 50)
              end
              required(:description).hash do
                required(:en).filled(:string, max_size?: 500)
                optional(:ru).maybe(:string, max_size?: 500)
                optional(:es).maybe(:string, max_size?: 500)
              end
              optional(:public).filled(:bool)
              optional(:sizes).maybe(:array).each(:string)
              optional(:features).maybe(:array).each(:hash) do
                optional(:id).filled(:string, :uuid_v4?)
                required(:title).hash do
                  required(:en).filled(:string, max_size?: 50)
                  optional(:ru).maybe(:string, max_size?: 50)
                  optional(:es).maybe(:string, max_size?: 50)
                end
                required(:description).hash do
                  required(:en).filled(:string, max_size?: 1_000)
                  optional(:ru).maybe(:string, max_size?: 1_000)
                  optional(:es).maybe(:string, max_size?: 1_000)
                end
                required(:kind).filled(Kinds)
                optional(:limit).filled(:string)
                optional(:limit_refresh).filled(Limits)
                optional(:modifiers).hash
                optional(:continious).filled(:bool)
              end
            end
          end
          # rubocop: enable Metrics/BlockLength

          private

          def validate_content(input)
            return unless input.key?(:id)

            input[:ancestry] = ::Nimble::Homebrews::Ancestry.find_by(user_id: input[:user].id, id: input[:id])
            return if input[:ancestry]

            ['Not found']
          end

          def do_prepare(input)
            input[:title].transform_values! { |value| sanitize(value) }
            input[:description].transform_values! { |value| sanitize(value) }
            input[:info] = input.slice(:sizes)
          end

          def do_persist(input)
            command =
              if input[:ancestry]
                HomebrewsV2Context::Import::Nimble::Ancestries::ChangeCommand.new
              else
                HomebrewsV2Context::Import::Nimble::Ancestries::AddCommand.new
              end
            command.call(input)
          end
        end
      end
    end
  end
end
