# frozen_string_literal: true

module Api
  module V1
    class BaseController < ApplicationController
      protect_from_forgery with: :null_session

      before_action :authenticate

      private

      def serializer_fields(serializer_class, default_only_fields=[], forbidden_fields=[])
        @serializer_attributes = serializer_class::ATTRIBUTES
        return {} if only_fields.any? && except_fields.any?
        return { only: (only_fields - forbidden_fields) } if only_fields.any?
        return { except: (except_fields + forbidden_fields) } if except_fields.any?

        { only: default_only_fields }
      end

      def only_fields
        @only_fields ||= params[:only_fields]&.split(',').to_a.map(&:to_sym) & @serializer_attributes
      end

      def except_fields
        @except_fields ||= params[:except_fields]&.split(',').to_a.map(&:to_sym) & @serializer_attributes
      end
    end
  end
end
