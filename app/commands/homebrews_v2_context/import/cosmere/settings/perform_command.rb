# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Cosmere
      module Settings
        class PerformCommand < BaseCommand
          use_contract do
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
            end
          end

          private

          def validate_content(input)
            if input.key?(:id)
              input[:setting] = ::Cosmere::Homebrews::Setting.find_by(user_id: input[:user].id, id: input[:id])
              return ['Not found'] unless input[:setting]
            end

            nil
          end

          def do_prepare(input)
            input[:title].transform_values! { |value| sanitize(value) }
            input[:description].transform_values! { |value| sanitize(value) }
          end

          def do_persist(input)
            command =
              if input[:setting]
                HomebrewsV2Context::Import::Cosmere::Settings::ChangeCommand.new
              else
                HomebrewsV2Context::Import::Cosmere::Settings::AddCommand.new
              end
            command.call(input)
          end
        end
      end
    end
  end
end
