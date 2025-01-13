# frozen_string_literal: true

module SerializeResource
  extend ActiveSupport::Concern

  private

  def serialize_resource(resource, serializer, key, serialized_fields={})
    Panko::Response.create { |response| { key => response.serializer(resource, serializer, **serialized_fields) } }
  end
end
