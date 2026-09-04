# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Cosmere
      module Specializations
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
              optional(:features).maybe(:array).each(:hash)
              required(:origin_class).filled(:string)
              optional(:only).maybe(:array, min_size?: 1).each(:string)
            end
          end

          private

          def validate_content(input) # rubocop: disable Metrics/AbcSize
            if input.key?(:id)
              input[:specialization] = ::Cosmere::Homebrews::Specialization.find_by(user_id: input[:user].id, id: input[:id])
              return ['Not found'] unless input[:specialization]
            end

            input[:features] = input[:features]&.map!(&:deep_symbolize_keys)
            input[:features]&.each do |feature|
              feature[:user] = input[:user]
              feature[:origin] = 'specialization'
              feature[:origin_value] = 'specialization.id'

              validate_result = add_feat_command.validate_all(feature)
              return validate_result[:raw_errors] if validate_result[:raw_errors]
            end

            nil
          end

          def do_prepare(input)
            input[:title].transform_values! { |value| sanitize(value) }
            input[:description].transform_values! { |value| sanitize(value) }
            input[:info] = input.slice(:only, :origin_class)
          end

          def do_persist(input)
            command =
              if input[:specialization]
                HomebrewsV2Context::Import::Cosmere::Specializations::ChangeCommand.new
              else
                HomebrewsV2Context::Import::Cosmere::Specializations::AddCommand.new
              end
            command.call(input)
          end

          def add_feat_command = Charkeeper::Container.resolve('commands.homebrews_v2_context.import.cosmere.feats.add')
        end
      end
    end
  end
end
